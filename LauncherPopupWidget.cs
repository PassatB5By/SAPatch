using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Threading;
using System.Windows.Forms;

namespace SAPatcher;

public class LauncherPopupWidget : Form
{
    private readonly System.Windows.Forms.Timer _timer;
    private readonly int _totalDurationMs = 5000;
    private int _elapsedMs = 0;
    private readonly string _launcherName;
    private readonly string _version;
    private readonly bool _isRussian;

    private readonly int _targetX;
    private readonly int _targetY;

    // Never activate or un-minimize other windows
    protected override bool ShowWithoutActivation => true;

    public LauncherPopupWidget(string launcherName = "Motion Launcher", string version = "v1.0.0")
    {
        _launcherName = launcherName;
        _version = version;
        _isRussian = SettingsManager.Current.Language != "en";

        // Frameless, non-movable, top-most, non-activating floating widget
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.Manual;
        ShowInTaskbar = false;
        TopMost = true;
        DoubleBuffered = true;
        BackColor = Color.FromArgb(11, 14, 23); // #0B0E17
        Size = new Size(500, 168);
        Opacity = 0.0;

        // Position strictly in the center of the primary display
        var workingArea = Screen.PrimaryScreen?.WorkingArea ?? new Rectangle(0, 0, 1920, 1080);
        _targetX = workingArea.Left + (workingArea.Width - Width) / 2;
        _targetY = workingArea.Top + (workingArea.Height - Height) / 2;
        Location = new Point(_targetX, _targetY + 20);

        // 60 FPS smooth rendering loop
        _timer = new System.Windows.Forms.Timer { Interval = 16 };
        _timer.Tick += OnTick;
    }

    protected override CreateParams CreateParams
    {
        get
        {
            var cp = base.CreateParams;
            cp.ExStyle |= 0x08000000; // WS_EX_NOACTIVATE (never steal focus or cause main window to restore)
            cp.ExStyle |= 0x00000080; // WS_EX_TOOLWINDOW
            cp.ExStyle |= 0x00000008; // WS_EX_TOPMOST
            cp.ClassStyle |= 0x00020000; // CS_DROPSHADOW
            return cp;
        }
    }

    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);
        _timer.Start();
    }

    private void OnTick(object? sender, EventArgs e)
    {
        _elapsedMs += 16;

        if (_elapsedMs >= _totalDurationMs)
        {
            _timer.Stop();
            Close();
            Dispose();
            return;
        }

        // Entrance Animation: Smooth Fade-In & Slide-Up into Center (0 to 350ms)
        if (_elapsedMs < 350)
        {
            float t = _elapsedMs / 350f;
            Opacity = Math.Clamp(t, 0f, 1f);
            float ease = (float)Math.Sin(t * Math.PI / 2);
            int curY = (int)(_targetY + (1f - ease) * 18);
            Location = new Point(_targetX, curY);
        }
        // Active Center Phase (350ms to 4650ms)
        else if (_elapsedMs < 4650)
        {
            Opacity = 1.0;
            Location = new Point(_targetX, _targetY);
        }
        // Exit Animation: Smooth Fade-Out & Lift (4650ms to 5000ms)
        else
        {
            float tRemaining = (_totalDurationMs - _elapsedMs) / 350f;
            Opacity = Math.Clamp(tRemaining, 0f, 1f);
            int curY = (int)(_targetY - (1f - tRemaining) * 8);
            Location = new Point(_targetX, curY);
        }

        Invalidate();
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        int w = ClientSize.Width;
        int h = ClientSize.Height;
        var bounds = new Rectangle(0, 0, w - 1, h - 1);

        // Dynamic glowing background with animated radial pulse
        float pulse = (float)(0.5 + 0.5 * Math.Sin(_elapsedMs / 220.0));
        using (var bgBrush = new LinearGradientBrush(bounds, Color.FromArgb(14, 18, 30), Color.FromArgb(8, 10, 18), 65f))
        {
            FillRoundedRectangle(g, bgBrush, bounds, 14);
        }

        // Animated circulating gradient neon border (Cyan to Electric Purple)
        float borderAngle = (float)((_elapsedMs / 18.0) % 360);
        using (var borderBrush = new LinearGradientBrush(bounds, Color.FromArgb(0, 229, 255), Color.FromArgb(121, 40, 202), borderAngle))
        using (var borderPen = new Pen(borderBrush, 2.0f))
        {
            DrawRoundedRectangle(g, borderPen, bounds, 14);
        }

        // Subtle ambient inner glow line at the top
        using (var topGlowPen = new Pen(Color.FromArgb((int)(40 + 30 * pulse), 0, 229, 255), 1.2f))
        {
            g.DrawLine(topGlowPen, 30, 2, w - 30, 2);
        }

        // Top Header Row: Pulsing status beacon & badge
        int topY = 18;

        // Animated Radar Beacon Ring around the pulse dot
        int beaconAlpha = (int)(180 * (1f - pulse));
        int beaconRadius = 8 + (int)(12 * pulse);
        using (var radarPen = new Pen(Color.FromArgb(beaconAlpha, 0, 229, 255), 1.5f))
        {
            g.DrawEllipse(radarPen, 24 - beaconRadius / 2 + 4, topY + 4 - beaconRadius / 2, beaconRadius, beaconRadius);
        }

        using (var dotBrush = new SolidBrush(Color.FromArgb(0, 229, 255)))
        {
            g.FillEllipse(dotBrush, 24, topY + 2, 8, 8);
        }

        string headerText = _isRussian ? "СЛУЖБА SAPATCHER АКТИВНА" : "SAPATCHER DAEMON ACTIVE";
        using (var headerFont = new Font("Segoe UI", 9f, FontStyle.Bold))
        using (var headerBrush = new SolidBrush(Color.FromArgb(0, 229, 255)))
        {
            g.DrawString(headerText, headerFont, headerBrush, 38, topY - 1);
        }

        // Version badge on top right
        string versionBadge = _version;
        using (var badgeFont = new Font("Consolas", 8.5f, FontStyle.Regular))
        using (var badgeBg = new SolidBrush(Color.FromArgb(20, 26, 42)))
        using (var badgeBorder = new Pen(Color.FromArgb(50, 65, 100), 1f))
        using (var badgeText = new SolidBrush(Color.FromArgb(170, 195, 240)))
        {
            var badgeRect = new Rectangle(w - 116, topY - 4, 94, 22);
            FillRoundedRectangle(g, badgeBg, badgeRect, 4);
            DrawRoundedRectangle(g, badgeBorder, badgeRect, 4);
            var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
            g.DrawString(versionBadge, badgeFont, badgeText, badgeRect, sf);
        }

        // Main Title (Bold, modern typography)
        string titleText = _isRussian
            ? $"{_launcherName} пропатчен SAPatcher"
            : $"{_launcherName} Patched & Optimized";
        using (var titleFont = new Font("Segoe UI", 13f, FontStyle.Bold))
        using (var titleBrush = new SolidBrush(Color.White))
        {
            g.DrawString(titleText, titleFont, titleBrush, 24, topY + 26);
        }

        // Subtitle / Features
        string subText = _isRussian
            ? "Фоновая служба подтвердила запуск • DXVK Vulkan • 4GB ОЗУ"
            : "Authorized by SAPatcher service • DXVK Vulkan • 4GB RAM";
        using (var subFont = new Font("Segoe UI", 9f, FontStyle.Regular))
        using (var subBrush = new SolidBrush(Color.FromArgb(175, 190, 215)))
        {
            g.DrawString(subText, subFont, subBrush, 24, topY + 54);
        }

        // Diagnostics info
        string diagText = _isRussian
            ? "Диагностика и лог: SAPatcher_Motion.log создан рядом с exe"
            : "Diagnostics & launch log: SAPatcher_Motion.log created next to exe";
        using (var diagFont = new Font("Segoe UI", 8.5f, FontStyle.Regular))
        using (var diagBrush = new SolidBrush(Color.FromArgb(0, 255, 178))) // Neon mint
        {
            g.DrawString(diagText, diagFont, diagBrush, 24, topY + 77);
        }

        // Bottom Countdown Bar Track & Animated Fill
        int barY = h - 22;
        int barX = 24;
        int barW = w - 48;
        int barH = 6;

        using (var trackBrush = new SolidBrush(Color.FromArgb(24, 30, 48)))
        {
            FillRoundedRectangle(g, trackBrush, new Rectangle(barX, barY, barW, barH), 3);
        }

        float progress = Math.Clamp(1.0f - ((float)_elapsedMs / _totalDurationMs), 0f, 1f);
        int fillW = (int)(barW * progress);
        if (fillW > 0)
        {
            var fillRect = new Rectangle(barX, barY, fillW, barH);
            using (var fillBrush = new LinearGradientBrush(
                new Rectangle(barX, barY, Math.Max(barW, 1), barH),
                Color.FromArgb(0, 229, 255),
                Color.FromArgb(121, 40, 202),
                0f))
            {
                FillRoundedRectangle(g, fillBrush, fillRect, 3);
            }
        }

        // Remaining Time Label
        double remainingSec = Math.Max(0, (_totalDurationMs - _elapsedMs) / 1000.0);
        string countText = _isRussian
            ? $"Закрытие через {remainingSec:0.0} с"
            : $"Closing in {remainingSec:0.0}s";
        using (var countFont = new Font("Segoe UI", 8f, FontStyle.Regular))
        using (var countBrush = new SolidBrush(Color.FromArgb(120, 135, 160)))
        {
            var sfRight = new StringFormat { Alignment = StringAlignment.Far };
            g.DrawString(countText, countFont, countBrush, w - 24, barY - 16, sfRight);
        }
    }

    private static void FillRoundedRectangle(Graphics g, Brush brush, Rectangle bounds, int radius)
    {
        using var path = CreateRoundedRectanglePath(bounds, radius);
        g.FillPath(brush, path);
    }

    private static void DrawRoundedRectangle(Graphics g, Pen pen, Rectangle bounds, int radius)
    {
        using var path = CreateRoundedRectanglePath(bounds, radius);
        g.DrawPath(pen, path);
    }

    private static GraphicsPath CreateRoundedRectanglePath(Rectangle bounds, int radius)
    {
        var path = new GraphicsPath();
        int diameter = radius * 2;
        var arc = new Rectangle(bounds.Location, new Size(diameter, diameter));

        // Top left
        path.AddArc(arc, 180, 90);
        // Top right
        arc.X = bounds.Right - diameter;
        path.AddArc(arc, 270, 90);
        // Bottom right
        arc.Y = bounds.Bottom - diameter;
        path.AddArc(arc, 0, 90);
        // Bottom left
        arc.X = bounds.Left;
        path.AddArc(arc, 90, 90);
        path.CloseFigure();
        return path;
    }

    public static void ShowPopup(string launcherName = "Motion Launcher", string version = "v1.0.0")
    {
        // Spawns smoothly on a dedicated background STA thread without activating or stealing focus
        var thread = new Thread(() =>
        {
            try
            {
                using var form = new LauncherPopupWidget(launcherName, version);
                Application.Run(form);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LauncherPopupWidget] Error: {ex.Message}");
            }
        });
        thread.SetApartmentState(ApartmentState.STA);
        thread.IsBackground = true;
        thread.Start();
    }
}
