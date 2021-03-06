function bindNeo4jCommon(opts) {

  const h = opts.h;
  const httpPost = opts.httpPost;
  const neo4jFormatter = opts.neo4jFormatter;

  const post = h.wrapCallback(function (statements, callback) {

    return httpPost.post({statements: statements}, callback);
  });


  /**
   * Makes the actual db call
   * @param queryStream
   * @returns {*}
   * @private
   */
  function dbClient(queryStream) {

    return queryStream
      .flatMap(post)
      .map(_processDBErrors);
  }


  function _processDBErrors(results) {
    return results;
  }


  function fetchAllTags() {
    return dbClient(_fetchAllTagsQuery())
      .flatMap(neo4jFormatter.formatSingleResultSingleData);
  }

  function _fetchAllTagsQuery() {

    var query = [
      {
        statement:
          'MATCH (n:Tag) ' +
          'WHERE n.uuid <> \'0\' ' +
          'RETURN n'
      }
    ];

    return h([query]);
  }

  return {
    db: dbClient,
    fetchAllTags
  };
}


module.exports = {
  bindNeo4jCommon
};
