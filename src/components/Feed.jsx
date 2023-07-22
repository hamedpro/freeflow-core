export const Feed = () => {
    var recommendations = uhc.recommend_to_me()

    return recommendations.map((thing_id) => (
        <span key={thing_id}>thing with thing id = {thing_id}</span>
    ))
}
