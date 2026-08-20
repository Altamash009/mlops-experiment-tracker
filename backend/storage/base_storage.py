from abc import ABC, abstractmethod


class BaseStorage(ABC):

    @abstractmethod
    def save(
        self,
        file,
        public_id,
        folder=None
    ):
        pass

    @abstractmethod
    def delete(
        self,
        public_id,
        resource_type=None,
        delivery_type=None
    ):
        pass