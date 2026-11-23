using System;
using System.IO.MemoryMappedFiles;
using System.Runtime.InteropServices;

namespace SAPatcher;

[StructLayout(LayoutKind.Sequential, Pack = 1)]
public struct OverlayIpcPacket
{
    public uint Magic;
    public uint Version;
    public uint Enabled;
    public uint Hotkey;
    public uint IsVisible;
    public int PosX;
    public int PosY;
    public float Scale;
    public uint ShowFps;
    public uint ShowGear;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)]
    public string Title;
}

public static class OverlayIpcServer
{
    private static MemoryMappedFile? _mmf;
    private static MemoryMappedViewAccessor? _accessor;
    private static readonly object SyncLock = new();
    private const string MapName = "SAPatcher_Overlay_IPC";
    private const int BufferSize = 512;

    public static void Initialize(AppSettings settings)
    {
        lock (SyncLock)
        {
            try
            {
                _mmf ??= MemoryMappedFile.CreateOrOpen(MapName, BufferSize, MemoryMappedFileAccess.ReadWrite);
                _accessor ??= _mmf.CreateViewAccessor(0, BufferSize, MemoryMappedFileAccess.ReadWrite);
                Update(settings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OverlayIpcServer] Init warning: {ex.Message}");
            }
        }
    }

    public static void Update(AppSettings settings)
    {
        lock (SyncLock)
        {
            try
            {
                if (_accessor == null || _mmf == null)
                {
                    Initialize(settings);
                    if (_accessor == null) return;
                }

                var packet = new OverlayIpcPacket
                {
                    Magic = 0x5341504F,
                    Version = 1,
                    Enabled = settings.OverlayEnabled ? 1u : 0u,
                    Hotkey = (uint)(settings.OverlayHotkeyCode != 0 ? settings.OverlayHotkeyCode : 0x7A),
                    IsVisible = 0u,
                    PosX = settings.OverlayPosX,
                    PosY = settings.OverlayPosY,
                    Scale = (float)(settings.OverlayScale > 0.1 ? settings.OverlayScale : 1.0),
                    ShowFps = settings.OverlayShowFps ? 1u : 0u,
                    ShowGear = settings.OverlayShowGear ? 1u : 0u,
                    Title = string.IsNullOrWhiteSpace(settings.OverlayTitle) ? "SAPatcher-1.1.0-Beta" : settings.OverlayTitle
                };

                int size = Marshal.SizeOf<OverlayIpcPacket>();
                byte[] raw = new byte[size];
                IntPtr ptr = Marshal.AllocHGlobal(size);
                try
                {
                    Marshal.StructureToPtr(packet, ptr, false);
                    Marshal.Copy(ptr, raw, 0, size);
                }
                finally
                {
                    Marshal.FreeHGlobal(ptr);
                }

                _accessor.WriteArray(0, raw, 0, size);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OverlayIpcServer] Update error: {ex.Message}");
            }
        }
    }
}
