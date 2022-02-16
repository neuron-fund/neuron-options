class uint256(int):
    def __new__(cls, *args, **kwargs):
        if args:
            assert args[0] >= 0, f'{args[0]} is invalid, shoud be >= 0'
        return int.__new__(cls, *args, **kwargs)    
    
    #def __init__(self, val):
    #    assert val >= 0, 'shoud be >= 0'
    #    super().__init__(val)

    def sub(self, val: int):        
        assert val >= 0
        assert val <= self
        return self - val

    def add(self, val: int):
        assert val >= 0
        return self + val

    def div(self, val: int):
        assert val >= 0
        return self // val

    def mul(self, val: int):
        assert val >= 0
        return self * val

class uint256list(list):
    def __new__(cls, *args, **kwargs):
        if args:
            assert type(args[0]) == uint256, 'elem type shold be uint256'
        return list.__new__(cls, *args, **kwargs)

class addrlist(list):
    def __new__(cls, *args, **kwargs):
        if args:
            assert type(args[0]) == address, 'elem type shold be address'
        return list.__new__(cls, *args, **kwargs)

address = str
uint80 = uint256