# OS2MOnaldo

## Installation guide

Make sure you have [Docker](https://www.docker.com/get-started/).

Since Naldo is only a frontend for MO, we need a running MO stack, refer to the [MO documentation](https://rammearkitektur.docs.magenta.dk/os2mo/) for guidance.

Now when you run `docker-compose up -d --build` and Naldo is running on <http://localhost:5173>.

## Development

Remember to run `yarn generate` after changing any GraphQL query.
