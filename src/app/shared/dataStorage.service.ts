import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, take, exhaustMap, tap } from "rxjs/operators";
import { AuthService } from "../auth/auth/auth.service";
import { Recipe } from "../recipes/recipe.model";
import { RecipeService } from "../recipes/recipe.service";

@Injectable({
  providedIn: "root",
})
export class dataStorageService {
  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  SaveRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(
        "https://recipe-book-f5923-default-rtdb.firebaseio.com/recipes.json",
        recipes,
        {
          observe: "response", // this gives body(Our Data) with http response..
        }
      )
      .subscribe(
        (responseData) => {
          console.log(responseData);
        },
        (error) => {
          console.log(error.message);
        }
      );
  }

  fetchRecipes() {
    // we can subscribe to get user.token and then unsubscribe
    // ex: this.authService.user.subscribe(...).unsubscribe();

    //but there is an other way!

    // take(n) -> rxjs operator -> When you are interested in only the first emission,
    // you want to use take. Maybe you want to see what the user first clicked on when they entered the page,
    // or you would want to subscribe to the click event and just take the first emission.
    // Another use-case is when you need to take a snapshot of data at a particular point in time but do not require further emissions.
    // n->  If you want to take a variable number of values based on some logic
    // take is the opposite of skip where take will take the first n number of emissions while skip will skip the first n number of emissions.

    // this.authService.user.pipe(take(1)).subscribe((user) => {
    // here the below code should come but this code is an observable and the below code is also an observable
    // ( we can't return observable inside an observable ) which has to return at the high level so there is an other method.
    // });

    // return this.http
    //   .get<Recipe[]>(
    //     "https://recipe-book-f5923-default-rtdb.firebaseio.com/recipes.json"
    //   )
    //   .pipe(
    //     map((recipes) => {
    //       return recipes.map((recipe) => {
    //         return {
    //           ...recipe,
    //           ingredients: recipe.ingredients ? recipe.ingredients : [],
    //         };
    //       });
    //     })
    //   )
    //   .subscribe((recipes: any) => {
    //     this.recipeService.fetchRecipes(recipes);
    //   });

    // return this.authService.user.pipe(
    //   take(1),
    //   exhaustMap(user => {
    //   return this.http.get<Recipe[]>(
    //     "https://recipe-book-f5923-default-rtdb.firebaseio.com/recipes.json", {
    //       params: new HttpParams().set('auth', user.token)
    //     }
    //   )
    // }),
    // map((recipes) => {
    //     return recipes.map((recipe) => {
    //       return {
    //         ...recipe,
    //         ingredients: recipe.ingredients ? recipe.ingredients : [],
    //       };
    //     });
    //   })
    // ).subscribe((recipes: any) => {
    //   this.recipeService.fetchRecipes(recipes);
    // })

    return this.http
      .get<Recipe[]>(
        "https://recipe-book-f5923-default-rtdb.firebaseio.com/recipes.json"
      )
      .pipe(
        map((recipes) => {
          return recipes.map((recipe) => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : [],
            };
          });
        })
      ).subscribe((recipes: any) => {
        this.recipeService.fetchRecipes(recipes);
      });
  }
}
