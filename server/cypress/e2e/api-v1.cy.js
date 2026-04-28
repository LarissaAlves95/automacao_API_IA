describe('GET /customers', () => {
  const API_URL = 'http://localhost:3001/customers';
  const TAMANHOS_VALIDOS = ['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise'];
  const INDUSTRIAS_VALIDAS = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance'];

  describe('Comportamento padrão - sem parâmetros', () => {
    it('deve retornar clientes com paginação padrão (page=1, limit=10)', () => {
      cy.request(API_URL).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('customers').that.is.an('array');
        expect(response.body).to.have.property('pageInfo');
        expect(response.body.pageInfo.currentPage).to.equal(1);
        expect(response.body.customers.length).to.be.lessThanOrEqual(10);
      });
    });

    it('deve retornar estrutura válida de pageInfo', () => {
      cy.request(API_URL).then((response) => {
        const pageInfo = response.body.pageInfo;
        expect(pageInfo).to.have.all.keys('currentPage', 'totalPages', 'totalCustomers');
        expect(pageInfo.currentPage).to.be.a('number');
        expect(pageInfo.totalPages).to.be.a('number');
        expect(pageInfo.totalCustomers).to.be.a('number');
      });
    });
  });

  describe('Parâmetro de query - page', () => {
    it('deve retornar clientes da página 2', () => {
      cy.request(`${API_URL}?page=2`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(2);
      });
    });

    it('deve retornar clientes da página 3 com limite específico', () => {
      cy.request(`${API_URL}?page=3&limit=5`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(3);
        expect(response.body.customers.length).to.be.lessThanOrEqual(5);
      });
    });

    it('deve retornar 400 Bad Request para page negativa', () => {
      cy.request({
        url: `${API_URL}?page=-1`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve retornar 400 Bad Request para page não numérica', () => {
      cy.request({
        url: `${API_URL}?page=abc`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve retornar 400 Bad Request para page com decimal', () => {
      cy.request({
        url: `${API_URL}?page=2.5`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  describe('Parâmetro de query - limit', () => {
    it('deve retornar clientes com limite de 5', () => {
      cy.request(`${API_URL}?limit=5`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers.length).to.be.lessThanOrEqual(5);
      });
    });

    it('deve retornar clientes com limite de 20', () => {
      cy.request(`${API_URL}?limit=20`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers.length).to.be.lessThanOrEqual(20);
      });
    });

    it('deve retornar 400 Bad Request para limit negativo', () => {
      cy.request({
        url: `${API_URL}?limit=-5`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve retornar 400 Bad Request para limit não numérico', () => {
      cy.request({
        url: `${API_URL}?limit=xyz`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve retornar 400 Bad Request para limit com decimal', () => {
      cy.request({
        url: `${API_URL}?limit=10.5`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve retornar 400 Bad Request para limit igual a zero', () => {
      cy.request({
        url: `${API_URL}?limit=0`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  describe('Parâmetro de query - size', () => {
    TAMANHOS_VALIDOS.forEach((tamanho) => {
      it(`deve filtrar clientes por tamanho: ${tamanho}`, () => {
        cy.request(`${API_URL}?size=${tamanho}`).then((response) => {
          expect(response.status).to.equal(200);
          response.body.customers.forEach((customer) => {
            expect(customer.size).to.equal(tamanho);
          });
        });
      });
    });

    it('deve retornar clientes de todos os tamanhos quando size=All', () => {
      cy.request(`${API_URL}?size=All`).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('deve retornar 400 Bad Request para valor de tamanho não suportado', () => {
      cy.request({
        url: `${API_URL}?size=SuperLarge`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve retornar 400 Bad Request para tamanho inválido (numérico)', () => {
      cy.request({
        url: `${API_URL}?size=123`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  describe('Parâmetro de query - industry', () => {
    INDUSTRIAS_VALIDAS.forEach((industria) => {
      it(`deve filtrar clientes por indústria: ${industria}`, () => {
        cy.request(`${API_URL}?industry=${industria}`).then((response) => {
          expect(response.status).to.equal(200);
          response.body.customers.forEach((customer) => {
            expect(customer.industry).to.equal(industria);
          });
        });
      });
    });

    it('deve lidar com filtro de indústria case-insensitive', () => {
      cy.request(`${API_URL}?industry=technology`).then((response) => {
        expect(response.status).to.equal(200);
        if (response.body.customers.length > 0) {
          response.body.customers.forEach((customer) => {
            expect(customer.industry.toLowerCase()).to.equal('technology');
          });
        }
      });
    });

    it('deve retornar clientes de todas as indústrias quando industry=All', () => {
      cy.request(`${API_URL}?industry=All`).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('deve retornar 400 Bad Request para valor de indústria não suportado', () => {
      cy.request({
        url: `${API_URL}?industry=Manufacturing`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve retornar 400 Bad Request para indústria inválida (numérica)', () => {
      cy.request({
        url: `${API_URL}?industry=999`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  describe('Filtros combinados e paginação', () => {
    it('deve filtrar por tamanho e indústria em página específica', () => {
      cy.request(`${API_URL}?page=2&limit=10&size=Medium&industry=Technology`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(2);
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Medium');
          expect(customer.industry).to.equal('Technology');
        });
      });
    });

    it('deve aplicar todos os parâmetros juntos', () => {
      cy.request(`${API_URL}?page=1&limit=15&size=Enterprise&industry=Finance`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(1);
        expect(response.body.customers.length).to.be.lessThanOrEqual(15);
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Enterprise');
          expect(customer.industry).to.equal('Finance');
        });
      });
    });
  });

  describe('Validação de estrutura de resposta', () => {
    it('deve retornar estrutura válida de objeto cliente', () => {
      cy.request(API_URL).then((response) => {
        expect(response.body.customers.length).to.be.greaterThan(0);
        const customer = response.body.customers[0];
        expect(customer).to.have.all.keys(
          'id',
          'name',
          'employees',
          'contactInfo',
          'size',
          'industry',
          'address'
        );
      });
    });

    it('deve ter id válido (número positivo)', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          expect(customer.id).to.be.a('number');
          expect(customer.id).to.be.greaterThan(0);
        });
      });
    });

    it('deve ter nome válido (string não vazia)', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          expect(customer.name).to.be.a('string');
          expect(customer.name).to.have.length.greaterThan(0);
        });
      });
    });

    it('deve ter contagem válida de funcionários (número positivo)', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          expect(customer.employees).to.be.a('number');
          expect(customer.employees).to.be.greaterThanOrEqual(0);
        });
      });
    });

    it('deve ter contactInfo como nulo ou objeto válido', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          if (customer.contactInfo !== null) {
            expect(customer.contactInfo).to.be.an('object');
            expect(customer.contactInfo).to.have.property('name');
            expect(customer.contactInfo).to.have.property('email');
          } else {
            expect(customer.contactInfo).to.be.null;
          }
        });
      });
    });

    it('deve ter tamanho válido baseado na contagem de funcionários', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          const employees = customer.employees;
          const size = customer.size;

          if (employees < 100) {
            expect(size).to.equal('Small');
          } else if (employees >= 100 && employees < 1000) {
            expect(size).to.equal('Medium');
          } else if (employees >= 1000 && employees < 10000) {
            expect(size).to.equal('Enterprise');
          } else if (employees >= 10000 && employees < 50000) {
            expect(size).to.equal('Large Enterprise');
          } else {
            expect(size).to.equal('Very Large Enterprise');
          }
        });
      });
    });

    it('deve ter indústria válida da lista de permitidas', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          expect(INDUSTRIAS_VALIDAS).to.include(customer.industry);
        });
      });
    });

    it('deve ter address como nulo ou objeto válido', () => {
      cy.request(API_URL).then((response) => {
        response.body.customers.forEach((customer) => {
          if (customer.address !== null) {
            expect(customer.address).to.be.an('object');
            expect(customer.address).to.have.all.keys(
              'street',
              'city',
              'state',
              'zipCode',
              'country'
            );
            expect(customer.address.street).to.be.a('string');
            expect(customer.address.city).to.be.a('string');
            expect(customer.address.state).to.be.a('string');
            expect(customer.address.zipCode).to.be.a('string');
            expect(customer.address.country).to.be.a('string');
          } else {
            expect(customer.address).to.be.null;
          }
        });
      });
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com múltiplos parâmetros com casos mistos', () => {
      cy.request({
        url: `${API_URL}?page=1&limit=10&size=Small&industry=logistics`,
        failOnStatusCode: false,
      }).then((response) => {
        expect([200, 400]).to.include(response.status);
      });
    });

    it('deve lidar com resultados vazios graciosamente', () => {
      cy.request(`${API_URL}?page=999`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers).to.be.an('array');
      });
    });

    it('deve retornar 400 para page e limit negativos', () => {
      cy.request({
        url: `${API_URL}?page=-1&limit=-5`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('deve lidar com valor muito grande de limit', () => {
      cy.request(`${API_URL}?limit=10000`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers).to.be.an('array');
      });
    });

    it('deve ignorar parâmetros de query extras ou desconhecidos', () => {
      cy.request(`${API_URL}?page=1&limit=10&unknown=value`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(1);
      });
    });
  });

  describe('Headers de resposta e status HTTP', () => {
    it('deve retornar status 200 para requisição válida', () => {
      cy.request(API_URL).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('deve retornar header Content-Type como application/json', () => {
      cy.request(API_URL).then((response) => {
        expect(response.headers['content-type']).to.include('application/json');
      });
    });

    it('deve retornar resposta JSON válida', () => {
      cy.request(API_URL).then((response) => {
        expect(() => JSON.stringify(response.body)).to.not.throw();
      });
    });
  });
});