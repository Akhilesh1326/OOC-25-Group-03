from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")

def search_chunks(chunks):
    results = []
    for chunk in chunks:
        res = es.search(index="rfp-index", body={"query": {"match": {"content": chunk}}})
        results.append(res)
    return results
