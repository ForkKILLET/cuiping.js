// https://docs.cypress.io/api/introduction/api.html

describe('Configuration', () => {
    it('save config', () => {
        cy.visit('/')
        cy.get('[data-cy="conf-useEditor"] > input').as('useEditor').uncheck()
        cy.get('[data-cy="conf-imageScale"] > input').as('imageScale').clear().type('2')

        cy.reload()
        cy.get('@useEditor').should('not.be.checked')
        cy.get('@imageScale').should('have.value', 2)

        cy.get('@useEditor').check()
        cy.get('@imageScale').clear().type('1')

        cy.reload()
        cy.get('@useEditor').should('be.checked')
        cy.get('@imageScale').should('have.value', 1)
    })
})
