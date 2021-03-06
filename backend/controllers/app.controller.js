const { AppModel } = require('../models/app.model')
const { normalizeArray } = require('../helpers/normalize.helper')

class AppController {
  constructor(pizzaProvider) {
    this._appMdl = new AppModel()
    this._pizzaProvider = pizzaProvider

    // cache the result of the parsePizzaProvider method
    this._parsePizzaProviderCache = null
  }

  getInitialState() {
    return Object.assign({}, this._appMdl.getInitialState(), {
      pizzeria: this._parsePizzaProviderCache.pizzeria
    })
  }

  getPizzasModel() {
    return this._appMdl.getPizzasModel()
  }

  getPizzasCategoriesModel() {
    return this._appMdl.getPizzasCategoriesModel()
  }

  getOrdersModel() {
    return this._appMdl.getOrdersModel()
  }

  getUsersModel() {
    return this._appMdl.getUsersModel()
  }

  getIngredientsModel() {
    return this._appMdl.getIngredientsModel()
  }

  parsePizzaProvider() {
    return new Promise((resolve, reject) => {
      if (this._parsePizzaProviderCache) {
        resolve(this._parsePizzaProviderCache)
      } else {
        this
          ._pizzaProvider
          .getPizzasAndPizzasCategories()
          .then(pizzasAndPizzasCategories => {
            // normalize the pizzas
            const normalizedPizzasAndPizzasCaterogies = {
              pizzeria: pizzasAndPizzasCategories.pizzeria,
              pizzas: normalizeArray(pizzasAndPizzasCategories.pizzas),
              pizzasCategories: normalizeArray(pizzasAndPizzasCategories.pizzasCategories),
              ingredients: normalizeArray(pizzasAndPizzasCategories.ingredients)
            }

            // as the ingredients will appear in the order of the fetched pizzas
            // sort the ingredients allIds array to match the alphabetical order
            normalizedPizzasAndPizzasCaterogies.ingredients.allIds = normalizedPizzasAndPizzasCaterogies.ingredients.allIds.sort((ingId1, ingId2) => {
              const ing1 = normalizedPizzasAndPizzasCaterogies.ingredients.byId[ingId1].name
              const ing2 = normalizedPizzasAndPizzasCaterogies.ingredients.byId[ingId2].name

              return ing1.localeCompare(ing2)
            })

            this._parsePizzaProviderCache = normalizedPizzasAndPizzasCaterogies

            this.getPizzasModel().setNormalizedData(this._parsePizzaProviderCache.pizzas)
            this.getPizzasCategoriesModel().setNormalizedData(this._parsePizzaProviderCache.pizzasCategories)
            this.getIngredientsModel().setNormalizedData(this._parsePizzaProviderCache.ingredients)

            resolve(this._parsePizzaProviderCache)
          })
          .catch(e => { })
      }
    })
  }
}

module.exports = { AppController }
