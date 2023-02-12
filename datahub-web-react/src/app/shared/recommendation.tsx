import { useGetSearchResultsForMultipleQuery } from '../../graphql/search.generated';
import { EntityType } from '../../types.generated';

export const useGetRecommendations = (types: Array<EntityType>) => {
    const { data } = useGetSearchResultsForMultipleQuery({
        variables: {
            input: {
                types,
                query: '*',
                start: 0,
                count: 5,
            },
        },
    });

    const recommendedData = data?.searchAcrossEntities?.searchResults?.map((searchResult) => searchResult.entity) || [];
    return [recommendedData];
};

export const useGetRecommendationsPaginated = (types: Array<EntityType>, page: number, count: number = 5) => {
    const { loading, data } = useGetSearchResultsForMultipleQuery({
        variables: {
            input: {
                types,
                query: '*',
                start: count * page,
                count: count,
            },
        },
    });

    const recommendedDataEntities = data?.searchAcrossEntities?.searchResults?.map((searchResult) => searchResult.entity) || [];
    return { isRecommendedLoading: loading, recommendedData: data, recommendedDataEntities };
};
