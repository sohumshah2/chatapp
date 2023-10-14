

def decomposeIntoPowersOf2(num):
    powersOf2 = []
    i = 1
    log_i = 0
    while i <= num:
        if i & num: # bitwise check to see if num contains 2^i
            powersOf2.append(log_i)
        i <<= 1 # double i
        log_i += 1
    return powersOf2

# print(decomposeIntoPowersOf2(51232))

# k = 3 ^ 823
# num ^ k
# num ^ k == num ^ (2 + 4 + 32 + 512 + ...)


# num ^ (i + 1) mod p = (((num ^ i) mod p) ^ 2) mod p

def compute(base, decomposedPower, mod):
    # decomposedPower = [0, 1, 3, 4]
    # base = 7
    # mod = 3
    # 7 ^ (2^0 + 2^1 + 2^3 + 2^4)

    prev = base % mod
    res = 1
    j = 0

    if decomposedPower[0] == 0:
        res = prev
        j += 1

    i = 1

    while i <= decomposedPower[len(decomposedPower) - 1]:
        prev = prev ** 2 % mod
        if decomposedPower[j] == i:
            res = res * prev % mod
        if decomposedPower[j] <= i:
            j += 1
        i += 1
    return res
    


# print(compute(7, [0,1,3], 11))

# calculate 7 ^ 11 mod 11
# print(compute(7, decomposeIntoPowersOf2(11), 11))

# print(compute(72, decomposeIntoPowersOf2(53), 5 ** 16))

# print(compute(13 ** 1043, decomposeIntoPowersOf2(1321), 143 ** 543))





p = 3 ** 1011
g = 5 ** 932

a = 17 ** 973

A = compute(g, decomposeIntoPowersOf2(a), p)

b = 3 ** 852
# B = (g ** b) % p
B = compute(g, decomposeIntoPowersOf2(b), p)


s1 = compute(B, decomposeIntoPowersOf2(a), p)
s2 = compute(A, decomposeIntoPowersOf2(b), p)


# s1 = (B ** a) % p
# s2 = (A ** b) % p

print('p', p)
print('g', g)
print('a', a)
print('A', A)
print('b', b)
print('B', B)
print('s1', s1)
print('s2', s2)
print(s1 == s2)

