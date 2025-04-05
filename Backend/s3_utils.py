import boto3
import hashlib
from botocore.exceptions import NoCredentialsError

BUCKET_NAME = "rfp-storage-hackathon"
REGION = "ap-south-1"

s3 = boto3.client("s3", region_name=REGION)  # auto-picks credentials

def get_file_hash(file_content: bytes) -> str:
    """Generate SHA256 hash of the file."""
    return hashlib.sha256(file_content).hexdigest()

def file_exists_in_s3(hash_name: str) -> bool:
    """Check if a file with the given hash already exists in the bucket."""
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=f"rfps/{hash_name}")
        return True
    except:
        return False

def upload_to_s3(file_content: bytes, original_filename: str, hash_name: str) -> str:
    """Upload file to S3 and return the file URL."""
    key = f"rfps/{hash_name}-{original_filename}"
    try:
        s3.put_object(Bucket=BUCKET_NAME, Key=key, Body=file_content)
        file_url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{key}"
        return file_url
    except NoCredentialsError:
        raise Exception("AWS credentials not found.")
