// mock/user.js
export default ({ mock }) => {
    mock.onGet('/test/user/John').reply(200, {
      users: [{ name: 'John Doe' }]
    });
  };
  