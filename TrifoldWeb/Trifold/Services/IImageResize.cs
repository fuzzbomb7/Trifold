using System.IO;

namespace Trifold.Services
{
    public interface IImageResize
    {
        void ResizeAndSave(string sourcePath, int height, int width, string savePath = null);
        void ResizeAndSave(Stream stream, int height, int width);
    }
}