import Colors from "./constants/colors";

const ingredients_to_dish = require("./assets/ingredients_to_dish.json");

export const scaleBbox = (bbox, imgWidth, imgHeight, cameraDims) => {
    const { x, y, width, height } = bbox;
    const cameraWidth = cameraDims.width,
        cameraHeight = cameraDims.height,
        cameraX = cameraDims.x,
        cameraY = cameraDims.y;

    const ratioW = cameraWidth / imgWidth,
        ratioH = cameraHeight / imgHeight;

    let xScaled = Math.floor(x * ratioW) + cameraX,
        yScaled = Math.floor(y * ratioH) + cameraY,
        wScaled = Math.floor(width * ratioW),
        hScaled = Math.floor(height * ratioH);
    wScaled = wScaled < cameraWidth ? wScaled : cameraWidth;
    // hScaled = hScaled < cameraHeight ? wScaled : cameraHeight;
    // hScaled = 0;

    return [xScaled, yScaled, wScaled, hScaled];
};

export const chooseColor = (choices) => {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
};

export const getUniqueIngredients = (ingredients, capitalize = false) => {
    const distinct = (value, index, self) => {
        return self.indexOf(value) === index;
    };

    const ingredientsList = ingredients.map((ingredient) => {
        if (capitalize)
            return (
                ingredient.name.charAt(0).toUpperCase() +
                ingredient.name.slice(1)
            );
        else return ingredient.name;
    });

    return ingredientsList.filter(distinct);
};

export const findDish = (ingredients) => {
    const uniqueIngredients = getUniqueIngredients(ingredients);

    const dishesList = uniqueIngredients.map((ingredient) => {
        return ingredients_to_dish[ingredient];
    });

    console.log("dishesList: ", dishesList);

    if (dishesList.length === 0) return null;

    let filteredDishes = dishesList[0];

    console.log("filteredDishes: ", filteredDishes);

    for (let idx = 1; idx < dishesList.length; idx++) {
        filteredDishes = filteredDishes.filter((dish) =>
            dishesList[idx].includes(dish)
        );
    }

    if (filteredDishes.length === 0) return null;
    console.log("Filtered ones: ", filteredDishes);
    console.log(
        "Final: ",
        filteredDishes.map((dishName) => {
            return { name: dishName, code: chooseColor(Colors.colorOptions) };
        })
    );

    return filteredDishes.map((dishName) => {
        return {
            name: capitalizeStr(dishName),
            code: chooseColor(Colors.colorOptions),
        };
    });
};

const capitalizeStr = (str) => {
    const words = str.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    return words.join(" ");
};
