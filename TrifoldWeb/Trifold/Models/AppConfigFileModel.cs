using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class AppConfigFileModel
    {
        public string PrimaryColor { get; set; }
        public TextContrastEnum PrimaryColorBrightness { get; set; }
        public string SecondaryColor { get; set; }
        public string AppGuid { get; set; }
    }
}
