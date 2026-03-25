---
title: "Evolutionary Algorithms: A Practical Introduction in Python"
date: 2025-10-03
description: "A practical introduction on how to program Evolutionary Algorithms in Python to solve optimization tasks, including Hill Climbers, selection methods, and TPOT."
layout: blog
---

# Introduction

Evolution by natural selection is a scientific theory which aims to explain how natural systems evolved over time into more complex systems. Four main components are necessary for evolution by natural selection to take place:

**Reproduction:** organisms need to be able to reproduce and generate offsprings in order to perpetuate their species.
**Heredity:** offsprings need to resemble to some extent their parents.
**Variation:** individuals in a population need to be different from one another.
**Change in fitness:** differences between individuals should lead to a change in their reproductive success (fitness).

In evolutionary algorithms, a fitness value can be used as a guide to indicate how close we are to a solution (eg. the higher the value, the closer we are to our desired objective). By grouping closer together all the elements in a population which share a similar fitnesses and further apart all the dissimilar elements, we can then construct a Fitness Landscape (Figure 1). One of the main problems faced by evolutionary algorithms is the presence of local optima in the fitness landscape. Local optima can, in fact, mislead our algorithm to not reach our desired global maxima in favour of a less optimal solution.

![Figure 1: Fitness Landscape Example](https://static.wixstatic.com/media/ffcc74_df6b3ed5c0d843dfb0dd423091dffb98~mv2.png/v1/fill/w_1020,h_484,al_c,lg_1,q_90,enc_auto/ffcc74_df6b3ed5c0d843dfb0dd423091dffb98~mv2.png)

*Figure 1: Fitness Landscape Example [1]*

Using variation operators such as crossover and mutations could then be possible to jump across a valley and reach our desired objective.

If using mutation, we allow for a small probability that a random element composing an individual mutates. As an example, if we represent an individual as a bitstring, using mutation we allow for a bit or more of an individual to randomly change (eg. change a 1 for a 0 and vice-versa).

When using crossover instead, we take two elements as parents and combine them together to generate a brand new offspring (Figure 2).

![Figure 2: Different types of crossover](https://static.wixstatic.com/media/ffcc74_8e1c7b41d1994f2fbb039c63414e8c7d~mv2.png/v1/fill/w_554,h_440,al_c,lg_1,q_85,enc_auto/ffcc74_8e1c7b41d1994f2fbb039c63414e8c7d~mv2.png)

*Figure 2: Different types of crossover [2]*

In this article, I will walk you through two different approaches to implement evolutionary algorithms in order to solve a simple optimization problem. These same techniques can then be used in order to tackle much more complicated tasks such as Machine Learning Hyperparameters Optimization.

# Hill Climber

A Hill Climber is a type of stochastic local search method which can be used in order to solve optimization problems.

This algorithm can be implemented using the following steps:

Create a random individual (eg. a bitstring, a string of characters, etc.).
Apply some form of random mutation to the individual.
If this mutation leads to an increase in fitness of the individual, replace the old individual with the new one and repeat iteratively until we reach our desired fitness score. If a mutation doesn't lead to an increase in fitness (eg. deleterious mutation), discard the mutated individual and keep the original one.

As a simple example, let's imagine we know that a genotype represented by a bitstring with 12 ones represents the best possible combination an element in a population can achieve. Our fitness score is simply the number of ones in the bitstring (the greater the number of ones, the closer we are to our desired score).

In order to implement our Hill Climber, we first need to create a mutation function. We will allow for a 30% probability that each individual bit might mutate.

```python
import numpy as np
import pandas as pd
import math
import random
import matplotlib.pyplot as plt

def mutations(individual):
    res = []
    for i in individual:
        if int(i) == 0:
            r = 1
        elif int(i) == 1:
            r = 0
        res.append(np.random.choice([int(i), r], p=[0.7, 0.3]))
    return ''.join([str(i) for i in res])
```

Finally, we can create our Hill Climber and test it with an individual with initial fitness of zero.

```python
def hill_climber(pop):
    fitness = pop[0].count('1')
    while fitness < len(pop[0]):
        res = mutations(*pop)
        fitness2 = res.count('1')
        if fitness2 > fitness:
            pop = [res]
            fitness = fitness2
    return fitness, pop

fitness, pop = hill_climber(['000000000000'])
print('Fitness:', fitness, '\nResulting Individual:', pop)
```

```
Fitness: 12
Resulting Individual: ['111111111111']
```

# Evolutionary Algorithms

One of the main problems of a Hill Climber is that it might be necessary to run the algorithm multiple times in order to try to escape a local minima. Using different initialization conditions, our initial individual might be placed closer or further away from the local optima.

Evolutionary algorithms solve this problem by using a population instead of a single individual (exploits parallelism) and by making use of crossover as well as mutation as variation mechanisms.

These two additions can be implemented in Python using the following two functions.

```python
def population(num, length):
    pop = []
    for j in range(num):
        res = []
        for i in range(length):
            res.append(np.random.choice([0, 1], p=[0.5, 0.5]))
        pop.append(''.join([str(i) for i in res]))
    return pop


def crossover(one, two, method):
    if (len(one) == len(two)) == True and method < 3:
        block = math.ceil(len(one) / (method + 1))
        res = []
        count = 1
        for i in range(0, len(one), block):
            if count % 2 == 0:
                res.append(one[i:i+block])
            else:
                res.append(two[i:i+block])
            count += 1
    else:
        return print('Just one or two points crossover allowed!')
    return ''.join(res)
```

Since we have an entire population of individuals, we can now make use of different techniques to decide which individuals to crossover and mutate. Some examples of selection techniques are:

**Fitness Proportionate Selection**
**Rank Based Selection**
**Tournament Selection**

When using **Fitness Proportionate Selection**, we create an imaginary wheel and divide it into N parts (where N is the number of individuals in the population). The size of each individual's share of the wheel is proportional to its fitness. A fixed point is chosen on the wheel circumference and the wheel is rotated — the region in front of the fixed point is selected. The wheel can be spun multiple times to select multiple individuals for crossover and mutation.

```python
def fitness_proportionate_selection(pop, fitnesses):
    portions = []
    for i in fitnesses:
        portions.append(i / sum(fitnesses))

    parents = []
    for i in range(2):
        parents.append(np.random.choice(pop, p=portions))

    return parents
```

By using a population of 4 individuals and plotting the results, the graph in Figure 3 can be reproduced.

![Figure 3: Fitness Proportionate Selection](https://static.wixstatic.com/media/ffcc74_06b2fda244d84551983e933c21b81562~mv2.png/v1/fill/w_496,h_343,al_c,lg_1,q_85,enc_auto/ffcc74_06b2fda244d84551983e933c21b81562~mv2.png)

*Figure 3: Fitness Proportionate Selection*

When using Fitness Proportionate Selection, if one element has much higher fitness compared to the others, it would be almost impossible for the other elements to be selected. To solve this, we can use **Rank Based Selection**.

Rank selection ranks each individual based on its fitness (eg. the worst individual gets Rank 1, the second-worst Rank 2, and so on). Using this method, the wheel shares will be more evenly distributed.

```python
def rank_selection(pop, fitnesses, number_of_parents):
    ranks = {}
    for i, j in zip(pop, fitnesses):
        ranks[i] = j

    a = np.sort(list(ranks.values()))
    res = {}
    for i in a:
        for j, z in zip(list(ranks.values()), list(ranks.keys())):
            if i == j:
                res[z] = i

    count = 0
    previous = np.inf
    for i, h in zip(list(res.values()), list(res.keys())):
        if i != previous:
            count += 1
        res[h] = count
        previous = i

    proportions = [i / sum(list(res.values())) for i in list(res.values())]

    parents = []
    for i in range(number_of_parents):
        selected = np.random.choice(pop, p=proportions)
        parents.append(selected)
        for i, j in enumerate(pop):
            if j == selected:
                pop.pop(i)
                proportions.pop(i)
                proportions = [i / sum(proportions) for i in proportions]
                break

    return parents
```

Plotting the results with a population of 4, using Rank Based Selection, gives us Figure 4.

![Figure 4: Rank Based Selection](https://static.wixstatic.com/media/ffcc74_5ee8a43442814ecfa34909b0eb24b7aa~mv2.png/v1/fill/w_455,h_344,al_c,lg_1,q_85,enc_auto/ffcc74_5ee8a43442814ecfa34909b0eb24b7aa~mv2.png)

*Figure 4: Rank Based Selection*

Finally, we can use **Tournament Selection**. We select N individuals at random from the population and choose the best among them. This process can be repeated to select multiple individuals.

```python
def tournment(pop, proportion_to_keep):
    '''
    If proportion_to_keep is less than 1, we input the percentage proportion of
    the amount of individuals we want to keep. If proportion is instead greater
    than 1, we input the explicit number of individuals we want to keep.
    '''
    if proportion_to_keep < 1:
        delete_num = len(pop) - (int(len(pop) * proportion_to_keep))
    else:
        delete_num = int(len(pop) - proportion_to_keep)

    for i in range(delete_num):
        a = pop.pop(random.randrange(len(pop)))
        b = pop.pop(random.randrange(len(pop)))
        if a.count('1') > b.count('1'):
            pop.append(a)
        else:
            pop.append(b)

    return pop
```

Now we have all the elements needed to create our evolutionary algorithm. There are two main types:

**Steady-State** (reproduction with replacement): once new offsprings are generated, they are immediately put back into the original population and some less fit elements are discarded to keep the population size constant.
**Generational** (reproduction without replacement): new offsprings are put into a new population; after a predetermined number of generations, this new population becomes the current population.

An example of a **steady-state** evolutionary algorithm using Rank Based Selection:

```python
pop = population(100, 12)
fitness = 0

while fitness < len(pop[0]):
    fitnesses = {}
    for i in pop:
        fitnesses[i] = i.count('1')
    fitness = max(fitnesses.values())
    value = max(fitnesses)
    parents = rank_selection(list(fitnesses.keys()), list(fitnesses.values()), 2)
    offspring = crossover(parents[0], parents[1], 2)
    offspring = mutations(offspring)
    for j, i in enumerate(pop):
        if i == min(fitnesses):
            pop.pop(j)
            break
    pop.append(offspring)
```

An example of a **generational** evolutionary algorithm using Rank Based Selection:

```python
pop = population(100, 12)
fitness = 0

while fitness < len(pop[0]):
    newpop = []
    for i in range(len(pop)):
        fitnesses = {}
        for i in pop:
            fitnesses[i] = i.count('1')
        fitness = max(fitnesses.values())
        value = max(fitnesses)
        parents = rank_selection(list(fitnesses.keys()), list(fitnesses.values()), 10)
        offspring = crossover(parents[0], parents[1], 2)
        offspring = mutations(offspring)
        newpop.append(offspring)
    pop = newpop
```

# TPOT

Evolutionary Algorithms can be implemented in Python using the [TPOT](http://epistasislab.github.io/tpot/) Auto Machine Learning library. TPOT is built on the scikit-learn library and can be used for either regression or classification tasks.

One of the main applications of Evolutionary Algorithms in Machine Learning is **Hyperparameters Optimization**. For example, imagine we create a population of N Machine Learning models with some predefined hyperparameters. We then calculate the accuracy of each model and keep just half (the ones that perform best). We generate offsprings with similar hyperparameters to the best models and repeat the cycle for a defined number of generations. In this way, just the best models survive at the end of the process.

# Bibliography

[1] Evolutionary optimization of robot morphology and control. Tønnes Nygaard. [ResearchGate](https://www.researchgate.net/figure/An-example-of-a-fairly-simple-three-dimensional-fitness-landscape-including-two-local_fig2_323772899)

[2] Genetic Algorithms in Wireless Networking: Techniques, Applications, and Issues. Usama Mehboob et al. [ResearchGate](https://www.researchgate.net/figure/Illustration-of-examples-of-one-point-two-points-and-uniform-crossover-methods-Adapted_fig5_268525551)