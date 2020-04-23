import { S3 } from "aws-sdk";
import { S3Event } from "aws-lambda";
import { sendInvoiceData } from "./invoiceService";
import {
  ProcessedKey,
  ProcessedResult,
  KeyValuePairs,
  MetaData,
  BlockFile
} from "./types";
import { VENDOR_DOMAIN_WHITELIST } from "./config"

export class FileValidationError extends Error {}

export class BucketValidationError extends Error {}

export class VendorValidationError extends Error {}

const KEY_WHITELIST: string[] = ["meta.json", "blocks.json", "kvp.json"];

const s3 = new S3();

const lookupFromKeyWhitelist = (key: string): string | undefined =>
  KEY_WHITELIST.find(validKey => key.indexOf(validKey) !== -1);

const isFolderDirectory = (key: string): boolean => key[key.length - 1] === "/";

const processKeys = (keyList: string[]): ProcessedKey[] => {
  const processedKeyList: ProcessedKey[] = [];

  keyList.forEach(key => {
    const keyLookedUp = lookupFromKeyWhitelist(key);
    if (keyLookedUp) {
      processedKeyList.push({
        keyName: keyLookedUp.replace(/.json/, ""),
        keyValue: key
      });
    }
  });
  return processedKeyList;
};

const mergeProcessResults = async (
  keyList: ProcessedKey[],
  srcBucket: string
): Promise<ProcessedResult> => {
  const result: ProcessedResult = {} as ProcessedResult;

  console.log(
    `Merging files ${keyList.map(key => key.keyName).join(",")} in ${srcBucket}`
  );

  for (const key of keyList) {
    const response = await s3
      .getObject({
        Bucket: srcBucket,
        Key: key.keyValue
      })
      .promise();
    const responseBody = response.Body;
    if (!responseBody) {
      throw new FileValidationError("Failed to retrieve file Body");
    }
    if (key.keyName === "blocks") {
      result[key.keyName] =
        (JSON.parse(responseBody.toString()) as BlockFile).Blocks || [];
    } else {
      result[
        key.keyName as keyof {
          kvp: KeyValuePairs;
          meta: MetaData;
        }
      ] = JSON.parse(responseBody.toString());
    }
  }

  if (!result.kvp || !result.meta) {
    throw new FileValidationError("Result not containing all required data");
  }

  return result;
};

const moveToProcessed = async (
  keyList: string[],
  srcBucket: string
): Promise<void> => {
  console.log(`Moving files to /processed`);
  for (const key of keyList) {
    if (!isFolderDirectory(key)) {
      await s3
        .copyObject({
          CopySource: `${srcBucket}/${key}`,
          Bucket: srcBucket,
          Key: key.replace(/extracted\//, "processed/")
        })
        .promise();
      await s3
        .deleteObject({
          Bucket: srcBucket,
          Key: key
        })
        .promise();
    }
  }
};

const getVendorDomain = (srcKey: string): string => {
  const vendorDomainMatches = srcKey.match(/\/([a-z\.]+)\//);
  if (!vendorDomainMatches || vendorDomainMatches.length !== 2) {
    throw new VendorValidationError(
      "Could not determine vendorDomain from object key"
    );
  }
  const vendorDomain = vendorDomainMatches[1];
  if (!VENDOR_DOMAIN_WHITELIST.split(",").includes(vendorDomain)) {
    throw new VendorValidationError("Vendor domain not whitelisted");
  }
  return vendorDomain;
};

export const handler = async (event: S3Event): Promise<string> => {
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key);
  const path = srcKey.slice(0, srcKey.lastIndexOf("/") + 1);
  const listParams = {
    Bucket: srcBucket,
    Delimiter: "/",
    Prefix: path
  };
  try {
    console.log(`Fetching invoice data files under ${path} in ${srcBucket}`);
    const objectList = await s3.listObjectsV2(listParams).promise();
    if (!objectList.Contents || objectList.Contents.length < 1) {
      throw new FileValidationError("Failed to access files under /extracted");
    }
    const keyList = objectList.Contents.map(content => content.Key as string);
    const invoiceData = await mergeProcessResults(
      processKeys(keyList),
      srcBucket
    );

    const vendorDomain = getVendorDomain(srcKey);
    await sendInvoiceData(invoiceData, vendorDomain);

    await moveToProcessed(keyList, srcBucket);

    console.log("SUCCESS");
    return "Finished sending results with files moved to /processed";
  } catch (error) {
    console.error(`FAILURE: ${error.message}`);
    return JSON.stringify(error, null, 2);
  }
};
