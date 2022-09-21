#!/bin/bash
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
" > temp_query.graphql

quicktype --src-lang graphql \
          --lang ts --just-types \
          --graphql-introspect http://localhost:5000/graphql/v1 \
          query.graphql 

# FIXME: Should probably be piped in instead of a weird temp file
rm query.graphql
