from abc import ABC, abstractmethod


class BaseStorage(ABC):

    @abstractmethod
    def save(self, file):
        pass

    @abstractmethod
    def delete(self, uri):
        pass