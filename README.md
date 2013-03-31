adambots-automated-scouting-kit
===============================

The "Adambots Automated Scouting Kit" (AASK) is a tool designed to help FRC teams strategize, prioritize, and optimize at FIRST events.  Yes, that was cheesy, I'll change it later.

Average Contribution Estimation:

Match Pair Frequency Matrix A
- Each (row,column) pair represents the number of times the row team has played with the column team
- Diagonal entries indicate the total number of matches that team has played.
- Pivoting is unnecessary because the result is guaranteed to be numerically stable.  Although the match pair frequency matrix is not diagonally dominant, the diagonal entry is HALF of the sum of the magnitudes of the (positive) entries of each row/column (irreducibly diagonally dominant).  Therefore, any permutation matrix would be the identity matrix, rendering pivoting--partial or complete--a wasteful endeavor.
- The LU Factorization of A is computed first, allowing quick computation of ECs for each point category.

Back/Forward Substitution is known to be numerically stable.