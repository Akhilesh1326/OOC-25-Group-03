import boto3
import hashlib
from botocore.exceptions import NoCredentialsError

BUCKET_NAME = "rfp-storage-hackathon"
REGION = "ap-south-1"

s3 = boto3.client("s3", region_name=REGION)  # Auto picks credentials

def get_file_hash(file_content: bytes) -> str:
    return hashlib.sha256(file_content).hexdigest()

def file_exists_in_s3(hash_name: str, original_filename: str) -> bool:
    key = f"rfps/{hash_name}-{original_filename}"
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=key)
        return True
    except:
        return False

def upload_to_s3(file_content: bytes, original_filename: str, hash_name: str) -> str:
    key = f"rfps/{hash_name}-{original_filename}"
    try:
        s3.put_object(Bucket=BUCKET_NAME, Key=key, Body=file_content)
        return f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{key}"
    except NoCredentialsError:
        raise Exception("AWS credentials not found.")

def delete_from_s3(hash_name: str, original_filename: str) -> bool:
    key = f"rfps/{hash_name}-{original_filename}"
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=key)
        return True
    except:
        return False
