import { Textract } from "aws-sdk";

export interface KeyValuePairs {
  [key: string]: string;
}

export interface BlockFile {
  Blocks: Textract.BlockList;
}

interface Attachment {
  contentType: string;
  contentDisposition: string;
  filename: string;
  size: string;
  s3key: string;
}

export interface MetaData {
  date: string;
  subject: string;
  from: string;
  text: string;
  textAsHtml: string;
  attachments: Attachment[];
}

export interface ProcessedKey {
  keyName: string;
  keyValue: string;
}

export interface ProcessedResult {
  blocks?: Textract.BlockList;
  kvp: KeyValuePairs;
  meta: MetaData;
}
