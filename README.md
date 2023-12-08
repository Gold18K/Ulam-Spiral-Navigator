# Ulam-Spiral-Navigator
An interactive site that allows you to navigate the Ulam spiral, with your hardware as the only limit!

Use the mouse to move around the Ulam spiral by clicking and dragging!

The top left of the window will tell you the current coordinates in relation to the center of the spiral, and if the number currently pointed at is a prime number or not.

The bottom left of the window allows you to choose a set of coordinates you wish to visit.

The bottom right of the windows allow you to choose:
- The side length of the section a single Worker is allowed to compute at a time (Default value: 150);
- The number of cores the site is allowed to use to compute the spiral (Default value: The number of cores of your CPU minus one);
- The number of cycles the Miller Rabin algorithm must use to check for primality (Default value: 6);

To download the current window, just right click and press Save image. If you want a download button, removing the only "display: none" string present in the index.html file will show a download button in the top right corner of the window.
