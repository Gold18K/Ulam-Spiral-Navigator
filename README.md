# Ulam-Spiral-Navigator

Use the mouse to move around the Ulam spiral by clicking and dragging!

The top left of the window will tell you the current coordinates in relation to the center of the spiral, and if the number currently pointed at is a prime number or not.

The bottom left of the window allows you to choose a set of coordinates you wish to visit.

The bottom right of the windows allow you to choose:
- The side length of the section a single Worker is allowed to compute at a time (Default value: 150);
- The number of cores the site is allowed to use to compute the spiral (Default value: The number of cores of your CPU minus one);
- The number of cycles the Miller Rabin algorithm must use to check for primality (Default value: 6);

The top right of the window allows you to download the portion of the Ulam Spiral that you computed!
