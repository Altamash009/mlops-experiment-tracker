from storage.base_storage import BaseStorage


class LocalStorage(BaseStorage):

    def save(
        self,
        file,
        public_id,
        folder=None
    ):
        pass

    def delete(
        self,
        public_id,
        resource_type=None,
        delivery_type=None
    ):
        pass