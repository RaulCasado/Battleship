from .boat import Boat
class Cruiser (Boat):
    def __init__(self,length,is_horizontal: bool, positions: list):
        super().__init__(length, is_horizontal, positions)