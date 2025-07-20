using ArcGIS.Desktop.Framework.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShorelinePredictionAddIn
{
    internal class YearInputBox : EditBox
    {
        public static string YearValue { get; set; }

        protected override void OnTextChange(string text)
        {
            YearValue = text;
        }
    }
}
