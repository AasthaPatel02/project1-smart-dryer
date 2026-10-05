# Smart Hairstyling Tool

An interactive prototype of a smart hair dryer, with a built-in testing panel for trying out each part of the device. By Aastha Patel.

The page has two sides:

- **Device UI (left):** a side-view dryer with a working barrel display, handle buttons (power, heat, fan), a nozzle LED ring, and a rear filter LED.
- **Testing controls (right):** manual test buttons, a scripted simulation, and a link to the project documentation.

## Link to Project
https://aasthapatel02.github.io/project1-smart-dryer/

## Features

- **Handle buttons:** PWR turns the dryer on and off. HEAT cycles Low, Med, High on a click, and a press-and-hold gives a cool shot. FAN cycles the fan speed.
- **Display alerts:** heat damage, overheat (with a cooldown timer), and filter-due notifications.
- **Manual testing:** buttons to toggle power, cycle heat and fan, trigger the overheat and heat damage alerts, toggle the filter alert, and reset everything.
- **Simulation:** plays a scripted 7-minute session at 10x speed (about 42 seconds). The manual controls are locked while it runs.
- **Info button:** opens a modal explaining how to use the prototype.

## Built with

- [Svelte 5](https://svelte.dev/)
- [Vite](https://vite.dev/)


## Project structure

```
src/
  App.svelte   all of the logic and markup (device, testing panel, simulation, info modal)
  app.css      all of the styling
  main.js      mounts the app
```

## Documentation

The link to the full project documentation is in the Testing controls panel in the app.