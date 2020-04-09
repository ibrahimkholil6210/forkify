import axios from 'axios';

export default class Recipe{
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.publisher = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }catch(err){
            alert("Something went wrong");
        }
    }

    calcTime(){
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng/3);
        this.cookTime = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitsLong = ['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds'];
        const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const unit = [...unitsShort, 'kg', 'g']

        const newIngredients = this.ingredients.map(item => {
            let ingredient = item.toLowerCase();
            unitsLong.forEach((unit,i) => {
                ingredient = ingredient.replace(unit,unitsShort[i]);
            });
            
            ingredient = ingredient.replace(/ *\([^)]*\) */g,' ');

            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(item2 => unit.includes(item2));

            let objIng;

            if(unitIndex > -1){
                const arrCount = arrIng.slice(0,unitIndex);
                let count;
                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-','+'));
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            }else if(parseInt(arrIng[0],10)){
                objIng = {
                    count: parseInt(arrIng[0],10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }else if(unitIndex === -1){
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            
            return objIng;
        });

        this.ingredients = newIngredients;
    }

    updateServings(type){
        const newServings = type === 'dec' ? this.servings - 1: this.servings + 1;


        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}