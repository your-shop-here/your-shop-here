import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { editorsContext } from 'src/helpers';

// Define a service using a base URL and expected endpoints
export const imagesManagerClient = createApi({
    reducerPath: 'managerClient',
    baseQuery: fetchBaseQuery({
        baseUrl: '',
    }),
    tagTypes: ['Images'],
    endpoints: (builder) => ({
        getLibraryFolders: builder.query<any[], void>({
            query: () => `${editorsContext().urls.getLibraryFoldersURL}`,
        }),
        getFolderImages: builder.query({
            query: (folderPath) => {
                const folderComponents = folderPath.split('/');
                const locale = folderComponents.shift();
                folderPath = folderComponents.join('/');

                return `${editorsContext().urls.getFolderImagesURL}&locale=${locale}&folderPath=${folderPath}`;
            },
            providesTags: ['Images'],
        }),
        uploadImage: builder.mutation({
            query: ({ folderPath, data }) => {
                const folderComponents = folderPath.split('/');
                const locale = folderComponents.shift();
                folderPath = folderComponents.join('/');

                return {
                    url: `${editorsContext().urls.imageUploaderURL}&locale=${locale}&uploadPath=${folderPath}`,
                    method: 'POST',
                    body: data,
                };
            },
            invalidatesTags: ['Images'],
        }),
    }),
});

export const {
    useGetLibraryFoldersQuery,
    useLazyGetFolderImagesQuery,
    useUploadImageMutation,
} = imagesManagerClient;
