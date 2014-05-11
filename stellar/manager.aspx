<%@ Page Language="C#" %>
<script runat="server">
  protected override void OnLoad(EventArgs e)
  {
    Response.Redirect("~/Home/index.castle");
    base.OnLoad(e);
  }
</script>
