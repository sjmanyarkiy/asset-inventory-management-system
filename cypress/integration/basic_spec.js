describe('Backend health', () => {
  it('returns running message at /', () => {
    cy.request('/').then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.have.property('message');
    });
  });
});
