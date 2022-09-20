#!/bin/bash
quicktype --graphql-introspect http://localhost:5000/graphql/v1 \
          --graphql-schema temp.gqlschema

echo -e "
    query {
      org_units(uuids: "asdf") {
        uuid
        objects {
          name
          unit_type {
            name
          }
          org_unit_level {
            name
          }
          parent {
            name
            parent {
              name
            }
          }
          validity {
            from
            to
          }
          addresses {
            name
            address_type {
              name
            }
            validity {
              from
              to
            }
          }
        }
      }
    }
" > query.graphql

quicktype --src-lang graphql --lang ts \
          --graphql-schema temp.gqlschema \
          query.graphql --just-types
