using ArcGIS.Core.CIM;
using ArcGIS.Core.Data;
using ArcGIS.Core.Geometry;
using ArcGIS.Desktop.Framework;
using ArcGIS.Desktop.Framework.Contracts;
using ArcGIS.Desktop.Framework.Dialogs;
using ArcGIS.Desktop.Framework.Threading.Tasks;
using ArcGIS.Desktop.Mapping;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ShorelinePredictionAddIn
{
    internal class PredictShoreLine : Button
    {
        protected override async void OnClick()
        {
            string year = YearInputBox.YearValue;

            if (!int.TryParse(year, out int parsedYear))
            {
                MessageBox.Show("Enter a valid year", "Invalid Input");
                return;
            }

            string pythonExe = @"D:\Program Files\Python\conda_envs\arcgis-clone\python.exe";
            string runnerPath = @"E:\Geomatics\ITI\GP\WEB-APP\react-app\backend\addin.py";
            string workingDir = @"E:\Geomatics\ITI\GP\WEB-APP\react-app\backend";

            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = pythonExe,
                Arguments = $"\"{runnerPath}\" {parsedYear}",
                WorkingDirectory = workingDir,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            try
            {
                using Process proc = Process.Start(psi);
                string output = await proc.StandardOutput.ReadToEndAsync();
                string error = await proc.StandardError.ReadToEndAsync();
                proc.WaitForExit();

                if (proc.ExitCode != 0)
                {
                    MessageBox.Show($"Error from Python:\n{error}", "Python Error");
                    return;
                }

                string shapefilePath = output.Trim();

                if (string.IsNullOrWhiteSpace(shapefilePath) || !File.Exists(shapefilePath))
                {
                    MessageBox.Show($"Shapefile not found:\n{shapefilePath}", "File Error");
                    return;
                }

                await QueuedTask.Run(() =>
                {
                    Map map = MapView.Active?.Map;
                    if (map == null)
                    {
                        MessageBox.Show("No active map found.", "Map Error");
                        return;
                    }

                    var existing = map.Layers.FirstOrDefault(l => l.Name.Contains("Predicted Shoreline"));
                    if (existing != null)
                        map.RemoveLayer(existing);

                    Uri shapefileUri = new Uri(shapefilePath, UriKind.Absolute);

                    Layer newLayer = LayerFactory.Instance.CreateLayer(shapefileUri, map, layerName: $"Predicted Shoreline {parsedYear}");

                    if (newLayer != null && MapView.Active != null)
                        MapView.Active.ZoomTo(newLayer);
                });


                MessageBox.Show("Prediction added to map successfully!", "Success");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to run Python prediction:\n{ex.Message}", "Unhandled Exception");
            }
        }
    }
}

