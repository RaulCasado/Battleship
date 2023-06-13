from abc import ABC, abstractmethod

class Boat(ABC):
    def __init__(self, length: int,is_horizontal: bool, positions: list):
        self._length = length
        self._is_horizontal = is_horizontal
        self._positions = positions
        self._sink = False
        self._shotted_parts = []
            
    @property
    def length(self):
        return self._length
    
    @property
    def is_horizontal(self):
        return self._is_horizontal
    
    @is_horizontal.setter
    def is_horizontal(self, value: bool):
        self._is_horizontal = value
        
    @property
    def positions(self):
        return self._positions
    
    @positions.setter
    def positions(self, value: list):
        self._positions = value
        
    @property
    def sink(self):
        return self._sink
    
    @sink.setter
    def sink(self, value: bool):
        self._sink = value
        
    @property
    def shotted_parts(self):
        return self._shotted_parts
    
    def hit(self, position: int):
        if position in self._positions:
            self._shotted_parts.append(position)
            return True
        else:
            return False
    
    def check_if_sink(self):
        # to check if the boat is sink
        if len(self._shotted_parts) == self._length:
            self._sink = True
            return True
        else:
            return False
