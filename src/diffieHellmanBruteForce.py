p = 23 ** 30030
g = 5 ** 63300


a = 4
b = 3
A = (g ** a) % p
B = (g ** b) % p


a_ = 1
b_ = 1

step = False

while True:
    A_ = (g ** a_) % p
    B_ = (g ** b_) % p

    if A_ == A and B_ == B:
        print('woahh found solns')
        print(f'a:{a_}, b: {b_}')
        break

    if b_ > a_:
        a_ += 1
        b_ = 1
    else:
        b_ += 1


    # if step:
    #     a_ += 1
    #     step = False
    # else:
    #     b_ += 1
    #     step = True
    print(a_, b_)



    # 1 1
    # 1 2
    # 2 1
    # 3 1
    # 3 2
    # 3 3
    # 4 1
    # 4 2
    # 4 3
    # 4 4