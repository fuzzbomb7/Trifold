using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Services
{
    public class StorageService : IStorageService
    {
        private readonly ILogger<StorageService> logger;
        private readonly CloudBlobClient cloud;

        /// <summary>
        /// Azure blob storage
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="configuration"></param>
        /// <param name="connectionString">For testing only</param>
        public StorageService(ILogger<StorageService> logger, IConfiguration configuration, string connectionString = null)
        {
            this.logger = logger;

            if(connectionString == null)
            {
                connectionString = configuration.GetConnectionString("AzureStorageConnection");
            }

            var storage = CloudStorageAccount.Parse(connectionString);
            cloud = storage.CreateCloudBlobClient();
        }

        /// <summary>
        /// Upload file to Azure blob storage
        /// </summary>
        /// <param name="containerName">Name of container</param>
        /// <param name="fileName">Name of file/blob</param>
        /// <param name="fileData">Stream containing file data</param>
        /// <returns>Storage URL of file</returns>
        public string UploadFile(string containerName, string fileName, Stream fileData)
        {
            try
            {
                var container = cloud.GetContainerReference(containerName);
                var blob = container.GetBlockBlobReference(fileName);
                blob.UploadFromStream(fileData);
                return blob.StorageUri.PrimaryUri.ToString();
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error uploading file to Azure blob storage");
                return null;
            }
        }

        /// <summary>
        /// Download file from Azure blob storage
        /// </summary>
        /// <param name="storageUri">Storage URL of file</param>
        /// <returns>MemoryStream containing file data</returns>
        public MemoryStream DownloadFile(string storageUri)
        {
            try
            {
                var blob = cloud.GetBlobReferenceFromServer(new Uri(storageUri));
                var file = new MemoryStream();
                blob.DownloadToStream(file);
                return file;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error downloading file from Azure blob storage");
                return null;
            }
        }

        /// <summary>
        /// Delete file from Azure blob storage
        /// </summary>
        /// <param name="storageUri">Storage URL of file</param>
        /// <returns>True if successful</returns>
        public bool DeleteFile(string storageUri)
        {
            try
            {
                var blob = cloud.GetBlobReferenceFromServer(new Uri(storageUri));
                blob.Delete();
                return true;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error deleting file from Azure blob storage");
                return false;
            }
        }

    }
}
