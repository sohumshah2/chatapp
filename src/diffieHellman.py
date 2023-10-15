import re, math, secrets

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




# Group 15 - 3072 bit - https://www.ietf.org/rfc/rfc3526.txt
pString = '''
FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1
29024E08 8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD
EF9519B3 CD3A431B 302B0A6D F25F1437 4FE1356D 6D51C245
E485B576 625E7EC6 F44C42E9 A637ED6B 0BFF5CB6 F406B7ED
EE386BFB 5A899FA5 AE9F2411 7C4B1FE6 49286651 ECE45B3D
C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8 FD24CF5F
83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D
670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B
E39E772C 180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9
DE2BCBF6 95581718 3995497C EA956AE5 15D22618 98FA0510
15728E5A 8AAAC42D AD33170D 04507A33 A85521AB DF1CBA64
ECFB8504 58DBEF0A 8AEA7157 5D060C7D B3970F85 A6E1E4C7
ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226 1AD2EE6B
F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C
BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31
43DB5BFC E0FD108E 4B82D120 A93AD2CA FFFFFFFF FFFFFFFF
'''
pString = re.sub(r'\s', '', pString)
p = int(pString, 16)
g = 2
print(p, '\n')
print(math.log2(p), '\n')

# p = 3 ** 1011
# g = 5 ** 932

a = secrets.randbits(256)
# a = 17 ** 973

A = compute(g, decomposeIntoPowersOf2(a), p)

# b = 3 ** 852
b = secrets.randbits(256)

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
print('\n', 's2', s2)
print(s1 == s2)

