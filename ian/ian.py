import numpy as np

mylist = np.array([])

for i in range(5):
	ran_num = np.random.randint(0, 10)
	mylist = np.append(mylist, ran_num)

mylist = np.array([4,5,3,2])

def find_min_asetheticism(_list):

	forward_aesth = np.array([])

	for i in range(len(_list)):
		forward_aesth = np.append(forward_aesth, len(_list) - i)

	for i in range(len(_list)):
		forward_aesth[i] = forward_aesth[i] - len(_list)
	
	its_time = False

	while not its_time:
		its_time = True
		for i in range(len(_list)):
			if forward_aesth[i] < _list[i]:
				its_time = False
		for i in range(len(_list)):
			forward_aesth[i] = forward_aesth[i] + 1
	
	forward_aesth -= 1
	
	print("faaa ",forward_aesth)
	
	area_used = 0
	for i in range(len(_list)):
		area_used += forward_aesth[i] - _list[i]

	return area_used

# print(find_min_asetheticism(mylist))
print(np.arange(5))