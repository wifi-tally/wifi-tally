
export const setSliderValue = (selector: string, value: number) => {
  // eslint-disable-next-line cypress/no-assigning-return-values
  let chain = cy.get(`${selector} *[role=slider]`)
    .trigger('keydown', { keyCode: 35, which: 35 }) // End
  let currentValue = 100
  while (value < currentValue) {
    if (currentValue - value >= 10) {
      chain = chain.trigger('keydown', { keyCode: 34, which: 34 }) // PageDown
      currentValue -= 10
    } else {
      chain = chain.trigger('keydown', { keyCode: 37, which: 37 }) // ArrowLeft
      currentValue -= 1
    }
  }
  return chain
}

export const validateSliderValue = (selector: string, value: number) => {
  return cy.get(`${selector} *[role=slider]`).should('have.attr', 'aria-valuenow', value.toString())
}
