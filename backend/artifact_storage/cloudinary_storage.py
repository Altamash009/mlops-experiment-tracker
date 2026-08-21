import os
import time

import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils

from dotenv import load_dotenv

from storage.base_storage import BaseStorage


load_dotenv()


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


class CloudinaryStorage(BaseStorage):

    def save(
        self,
        file,
        public_id,
        folder="mlops-tracker"
    ):
        result = cloudinary.uploader.upload(
            file,
            resource_type="auto",
            public_id=public_id,
            folder=folder,
            type="private"
        )

        return {
            "public_id": result.get("public_id"),
            "secure_url": result.get("secure_url"),
            "resource_type": result.get("resource_type"),
            "format": result.get("format"),
            "bytes": result.get("bytes"),
            "asset_id": result.get("asset_id")
        }

    def delete(
        self,
        public_id,
        resource_type="raw",
        delivery_type="private"
    ):
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            type=delivery_type
        )

        return result
    
    def generate_download_url(
        self,
        public_id,
        file_format,
        expires_at,
        resource_type="raw",
        delivery_type="private"
    ):
        return cloudinary.utils.private_download_url(
            public_id=public_id,
            format=file_format,
            resource_type=resource_type,
            type=delivery_type,
            expires_at=expires_at
        )