from .boat import Boat
class Submarine (Boat):
    def __init__(self, length: int,is_horizontal: bool, positions: list):
        super().__init__(length, is_horizontal, positions)