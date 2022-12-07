#!/bin/bash
echo -e "
query {
  org_units(uuids: "derp") {
    objects {
      name
    }
  }
}
" > query.graphql

quicktype --src-lang graphql \
          --lang ts --just-types \
          --graphql-introspect http://127.0.0.1:5000/graphql/v3 \
          query.graphql 

# FIXME: Should probably be piped in instead of a weird temp file
rm query.graphql
