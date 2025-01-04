using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Services
{
    public interface IStorageService
    {
        string UploadFile(string containerName, string fileName, Stream fileData);
        MemoryStream DownloadFile(string storageUri);
        bool DeleteFile(string storageUri);
    }
}
