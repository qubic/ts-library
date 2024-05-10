describe("Block Transactions", () => {
  const tick = 12956870;
  it("Response is Ok", async () => {
    try {
      const fetch = jest.fn().mockResolvedValue({ status: 200 });
      jest.doMock("node-fetch", () => ({ fetch }));

      const endpoint = `https://testapi.qubic.org/v1/ticks/${tick}/approved-transactions`;
      const response = await fetch(endpoint);
      expect(response.status).toBe(200);
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  });
});
