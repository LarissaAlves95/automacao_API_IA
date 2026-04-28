describe('GET /customers', () => {
  const apiUrl = Cypress.env('API_URL')

  it('Retorna status 200 ao listar clientes sem filtros', () => {
    cy.request('GET', `${apiUrl}customers`)
      .then(({ status }) => {
        expect(status).to.equal(200)
      })
  })

  it('Retorna estrutura correta com propriedades esperadas', () => {
    cy.request('GET', `${apiUrl}customers`)
      .then(({ body }) => {
        const { customers, pageInfo } = body
        expect(customers).to.be.an('array')
        expect(pageInfo).to.have.all.keys('currentPage', 'totalPages', 'totalCustomers')
      })
  })

  it('Filtra clientes por tamanho Medium', () => {
    cy.request('GET', `${apiUrl}customers?size=Medium`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.size).to.equal('Medium')
        })
      })
  })

  it('Filtra clientes por indústria Technology', () => {
    cy.request('GET', `${apiUrl}customers?industry=Technology`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.industry).to.equal('Technology')
        })
      })
  })

  it('Filtra clientes por tamanho e indústria', () => {
    cy.request('GET', `${apiUrl}customers?size=Medium&industry=Technology`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.size).to.equal('Medium')
          expect(customer.industry).to.equal('Technology')
        })
      })
  })

  it('Retorna status 200 com paginação personalizada', () => {
    cy.request('GET', `${apiUrl}customers?page=2&limit=10`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        const { pageInfo } = body
        expect(pageInfo.currentPage).to.equal(2)
      })
  })

  it('Retorna status 400 para tamanho inválido', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}customers?size=InvalidSize`,
      failOnStatusCode: false
    })
      .then(({ status }) => {
        expect(status).to.equal(400)
      })
  })

  it('Retorna status 400 para indústria inválida', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}customers?industry=InvalidIndustry`,
      failOnStatusCode: false
    })
      .then(({ status }) => {
        expect(status).to.equal(400)
      })
  })

  it('Retorna status 400 para página negativa', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}customers?page=-1`,
      failOnStatusCode: false
    })
      .then(({ status }) => {
        expect(status).to.equal(400)
      })
  })

  it('Retorna status 400 para limite não numérico', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}customers?limit=abc`,
      failOnStatusCode: false
    })
      .then(({ status }) => {
        expect(status).to.equal(400)
      })
  })

  it('Retorna dados completos do cliente incluindo endereço', () => {
    cy.request('GET', `${apiUrl}customers`)
      .then(({ body }) => {
        const { customers } = body
        const customer = customers[0]
        const { id, name, employees, size, industry, address, contactInfo } = customer
        expect(id).to.be.a('number')
        expect(name).to.be.a('string')
        expect(employees).to.be.a('number')
        expect(size).to.be.oneOf(['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise'])
        expect(industry).to.be.oneOf(['Logistics', 'Retail', 'Technology', 'HR', 'Finance'])
        if (address) {
          const { street, city, state, zipCode, country } = address
          expect(street).to.be.a('string')
          expect(city).to.be.a('string')
          expect(state).to.be.a('string')
          expect(zipCode).to.be.a('string')
          expect(country).to.be.a('string')
        }
      })
  })

  it('Valida tamanho Small para clientes com menos de 100 funcionários', () => {
    cy.request('GET', `${apiUrl}customers?size=Small`)
      .then(({ body }) => {
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.employees).to.be.lessThan(100)
        })
      })
  })

  it('Valida tamanho Medium para clientes com 100 a 999 funcionários', () => {
    cy.request('GET', `${apiUrl}customers?size=Medium`)
      .then(({ body }) => {
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.employees).to.be.at.least(100)
          expect(customer.employees).to.be.lessThan(1000)
        })
      })
  })

  it('Valida tamanho Enterprise para clientes com 1000 a 9999 funcionários', () => {
    cy.request('GET', `${apiUrl}customers?size=Enterprise`)
      .then(({ body }) => {
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.employees).to.be.at.least(1000)
          expect(customer.employees).to.be.lessThan(10000)
        })
      })
  })

  it('Valida tamanho Large Enterprise para clientes com 10000 a 49999 funcionários', () => {
    cy.request('GET', `${apiUrl}customers?size=Large Enterprise`)
      .then(({ body }) => {
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.employees).to.be.at.least(10000)
          expect(customer.employees).to.be.lessThan(50000)
        })
      })
  })

  it('Valida tamanho Very Large Enterprise para clientes com 50000 ou mais funcionários', () => {
    cy.request('GET', `${apiUrl}customers?size=Very Large Enterprise`)
      .then(({ body }) => {
        const { customers } = body
        customers.forEach(customer => {
          expect(customer.employees).to.be.at.least(50000)
        })
      })
  })

  it('Retorna valores nulos para contactInfo quando não disponível', () => {
    cy.request('GET', `${apiUrl}customers`)
      .then(({ body }) => {
        const { customers } = body
        const customerWithoutContact = customers.find(c => c.contactInfo === null)
        if (customerWithoutContact) {
          const { contactInfo } = customerWithoutContact
          expect(contactInfo).to.be.null
        }
      })
  })

  it('Retorna valores nulos para address quando não disponível', () => {
    cy.request('GET', `${apiUrl}customers`)
      .then(({ body }) => {
        const { customers } = body
        const customerWithoutAddress = customers.find(c => c.address === null)
        if (customerWithoutAddress) {
          const { address } = customerWithoutAddress
          expect(address).to.be.null
        }
      })
  })

  it('Respeita o limite de clientes por página', () => {
    cy.request('GET', `${apiUrl}customers?limit=5`)
      .then(({ body }) => {
        const { customers } = body
        expect(customers).to.have.lengthOf.at.most(5)
      })
  })

  it('Retorna página correta de acordo com o parâmetro page', () => {
    cy.request('GET', `${apiUrl}customers?page=1&limit=10`)
      .then(({ body: body1 }) => {
        const { customers: customers1, pageInfo: pageInfo1 } = body1
        cy.request('GET', `${apiUrl}customers?page=2&limit=10`)
          .then(({ body: body2 }) => {
            const { customers: customers2, pageInfo: pageInfo2 } = body2
            expect(pageInfo1.currentPage).to.equal(1)
            expect(pageInfo2.currentPage).to.equal(2)
            expect(customers1[0].id).not.to.equal(customers2[0].id)
          })
      })
  })

  it('Retorna status 400 para page com valor zero', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}customers?page=0`,
      failOnStatusCode: false
    })
      .then(({ status }) => {
        expect(status).to.equal(400)
      })
  })

  it('Retorna status 400 para limit com valor zero', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}customers?limit=0`,
      failOnStatusCode: false
    })
      .then(({ status }) => {
        expect(status).to.equal(400)
      })
  })
})