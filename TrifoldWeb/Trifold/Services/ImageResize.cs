using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.IO;

namespace Trifold.Services
{
    public class ImageResize : IImageResize
    {
        /// <summary>
        /// Resize image and save to specified path. If height or width is 0, the aspect ratio will be maintained.
        /// </summary>
        /// <param name="sourcePath">Full path of file to resize</param>
        /// <param name="height">Resized height</param>
        /// <param name="width">Resized width</param>
        /// <param name="savePath">Full path to save resized file to. If null, will overwrite file at sourcePath</param>

        public void ResizeAndSave(string sourcePath, int height, int width, string savePath = null)
        {
            using (Image<Rgba32> image = Image.Load(sourcePath))
            {
                image.Mutate(x => x.Resize(width, height));
                image.Save(savePath ?? sourcePath);
            }
        }

        /// <summary>
        /// Resize image and save to specified stream. If height or width is 0, the aspect ratio will be maintained.
        /// </summary>
        /// <param name="stream">Stream containing the image data</param>
        /// <param name="height">Resized height</param>
        /// <param name="width">Resized width</param>
        public void ResizeAndSave(Stream stream, int height, int width)
        {
            IImageFormat format;

            using (Image<Rgba32> image = Image.Load(stream, out format))
            {
                image.Mutate(x => x.Resize(width, height));
                image.Save(stream, format);
            }
        }
    }
}
