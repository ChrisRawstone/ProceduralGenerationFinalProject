import numpy as np
from multiprocessing import Pool

def simulate_joint_probabilities(_):
    num_simulations = 10000000

    P = np.array([
        [3/7, 4/7, 0,   0,   0],
        [0,   1/3, 2/3, 0,   0],
        [0,   0,   3/4, 1/4, 0],
        [0,   0,   0,   2/5, 3/5],
        [2/9, 0,   0,   0,   7/9]
    ])
    
    initial_distribution = np.array([0, 8/22, 4/22, 0, 10/22])
    
    P5 = np.linalg.matrix_power(P, 5)
    P18 = np.linalg.matrix_power(P, 18)
    
    initial_states = np.random.choice(a=[0, 1, 2, 3, 4], size=num_simulations, p=initial_distribution)
    
    states_at_5 = np.array([np.random.choice(a=[0, 1, 2, 3, 4], p=P5[initial_state]) for initial_state in initial_states])
    states_at_23 = np.array([np.random.choice(a=[0, 1, 2, 3, 4], p=P18[state_at_5]) for state_at_5 in states_at_5])
    
    joint_occurrences = np.zeros((5, 5))
    
    for i in range(num_simulations):
        joint_occurrences[states_at_5[i], states_at_23[i]] += 1
    
    joint_probabilities_matrix = joint_occurrences / num_simulations
    weighted_sum = np.sum((np.arange(1, 6)[:, np.newaxis] * np.arange(1, 6)) * joint_probabilities_matrix)
    
    return joint_probabilities_matrix, weighted_sum

def main():
    num_processes = 20
    with Pool(num_processes) as pool:
        results = pool.map(simulate_joint_probabilities, range(num_processes))
    
    # Calculate the mean of the joint probability matrices and weighted sums
    mean_joint_probabilities = np.mean([result[0] for result in results], axis=0)
    mean_weighted_sum = np.mean([result[1] for result in results])
    
    print("Mean Joint Probabilities Matrix:")
    print(mean_joint_probabilities)
    print("Mean Weighted Sum:", mean_weighted_sum)

if __name__ == "__main__":
    main()
