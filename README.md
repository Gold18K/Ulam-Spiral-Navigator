# Ulam Spiral Navigator

You can find it [here](https://gold18k.github.io/Ulam-Spiral-Navigator/)

![Demo](https://i.ibb.co/HHyX3SC/Screenshot-2024-08-28-112144.png)

Use the mouse to move around the Ulam spiral by clicking and dragging!

The top left of the window will tell you the current coordinates in relation to the center of the spiral, and if the number currently pointed at is a prime number or not.

The bottom left of the window allows you to choose a set of coordinates you wish to visit.

The bottom right of the window allow you to choose:
- The side length (number of pixels) of the section a single Worker is allowed to compute at a time (Default value: 150);
- The number of cores the site is allowed to use to compute the spiral (Default value: The number of cores of your CPU minus one);
- The number of iteration the Miller Rabin algorithm will run to check for primality (Default value: 6);

The top right of the window allows you to download the generated portion of the Ulam Spiral as a .png file;

Clicking one of the pixels will let you copy to clipboard the informations about that particular pixel!
