using System;
using System.Threading;
using System.Windows.Forms;

namespace SAPatcher;

public static class GameOverlayHost
{
    private static Thread? _overlayThread;
    private static GameOverlayForm? _form;
    private static ApplicationContext? _appContext;
    private static readonly object _lock = new();

    public static void Start()
    {
        lock (_lock)
        {
            if (_overlayThread != null && _overlayThread.IsAlive) return;

            _overlayThread = new Thread(() =>
            {
                try
                {
                    Application.EnableVisualStyles();
                    Application.SetCompatibleTextRenderingDefault(false);

                    _form = new GameOverlayForm();
                    // Using ApplicationContext prevents Windows Forms from automatically forcing the form to be shown on startup
                    _appContext = new ApplicationContext();
                    Application.Run(_appContext);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[GameOverlayHost] Thread exception: {ex.Message}");
                }
            })
            {
                IsBackground = true,
                Name = "GameOverlayThread"
            };

            _overlayThread.SetApartmentState(ApartmentState.STA);
            _overlayThread.Start();
        }
    }

    public static void Stop()
    {
        lock (_lock)
        {
            if (_form != null && !_form.IsDisposed)
            {
                try
                {
                    _form.Invoke(new Action(() =>
                    {
                        _form.CloseOverlay();
                        _form.Close();
                    }));
                }
                catch {}
            }
            if (_appContext != null)
            {
                try
                {
                    _appContext.ExitThread();
                }
                catch {}
            }
            _form = null;
            _appContext = null;
            _overlayThread = null;
        }
    }

    public static void ToggleOverlay()
    {
        if (_form != null && !_form.IsDisposed)
        {
            try
            {
                _form.BeginInvoke(new Action(() => _form.ToggleOverlay()));
            }
            catch {}
        }
    }

    public static void CloseOverlay()
    {
        if (_form != null && !_form.IsDisposed)
        {
            try
            {
                _form.BeginInvoke(new Action(() => _form.CloseOverlay()));
            }
            catch {}
        }
    }
}
