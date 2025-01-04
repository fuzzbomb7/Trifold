using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class SupportRequestModel
    {
        public string emailAddress;
        public string message;
        public string osVersion;
        public int eventId;
        public string manufacturer;
        public string model;
        public string appId;
        public int requestType;
    }

    public enum SupportRequestType
    {
        Vendor,
        App
    }
}
